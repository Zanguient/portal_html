/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *
 *  Versão 1.0 - 06/05/2016
 *
 */

// App
angular.module("administrativo-bandeira-sacado", []).controller("administrativo-bandeiraSacadoCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter',
                                             function($scope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter){ 
    
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário
    // Filtros
    $scope.adquirentes = [];
    $scope.bandeiras = [];
	$scope.bandeirasAlteracao = [];
	$scope.bandeirasCadastro = [];
	$scope.bandeirasFixo = [];
	$scope.sacado = "";
	$scope.bandeiraSacado = [];
	$scope.statusLogado = false;
    $scope.filtro = {adquirente : null, bandeira : null, sacado : null,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0};
    var divPortletFiltroPos = 0; // posição da div que vai receber o loading progress
	var divPortletBodyPos = 1; // posição da div que vai receber o loading progress
    // Cadastro
    $scope.cadastro = {adquirente : "", sacado : "", parcelas : 0, bandeira : { cdBandeira : 0, nmBandeira : '' }};
    // Alteração
    $scope.alterando = true;                                             
    $scope.alteracao = {id : 0, grupo : 0, adquirente : null, sacado : "", parcelas : 0, bandeira : { cdBandeira : 0, nmBandeira : '' }};     
	$index = 0;
    // flag
    $scope.exibePrimeiraLinha = false; 
    $scope.exibeTela = false;                                             
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    //var permissaoRemocao = false;              
                                                 
    
   // Inicialização do controller
    $scope.administrativo_bandeiraSacadoInit = function(){
			// Título da página 
			$scope.pagina.titulo = 'Administrativo';                          
			$scope.pagina.subtitulo = 'Bandeira Sacado';
			// Quando houver uma mudança de rota => modificar estado
			$scope.$on('mudancaDeRota', function(event, state, params){
				$state.go(state, params);
			});
			// Quando houver alteração do grupo empresa na barra administrativa                                           
			$scope.$on('alterouGrupoEmpresa', function(event){ 
				if($scope.exibeTela){
					// Avalia grupo empresa
					if($scope.usuariologado.grupoempresa){ 
						// Reseta seleção de filtro específico de empresa
						buscaAdquirentes();
						buscaBandeiraFixo();
						buscaBandeira();
						$scope.sacado = null;
						$scope.statusLogado = true;
						buscaBandeiraSacado();
					}else{ // reseta tudo e não faz buscas
						$scope.statusLogado = false;
						$scope.adquirentes = [];
						$scope.bandeiras = [];
						$scope.sacado = null;
						$scope.bandeiraSacado = [];
						$scope.filtro.adquirente = '';
						$scope.filtro.bandeira = '';
						$scope.filtro.sacado = '';
						$scope.filtro.faixa_registros = '0-0';
						$scope.filtro.pagina = 1;
						$scope.filtro.total_paginas = 0;
						$scope.filtro.total_registros = 0;
					}
				}
			}); 
			// Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
			$scope.$on('acessoDeTelaNotificado', function(event){
				$scope.exibeTela = true;
				// Avalia grupo empresa
				if($scope.usuariologado.grupoempresa){ 
					// Reseta seleção de filtro específico de empresa
					buscaAdquirentes();
					buscaBandeiraFixo();
					buscaBandeira();
					$scope.sacado = null;
					$scope.statusLogado = true;
					buscaBandeiraSacado();
				}else{ // reseta tudo e não faz buscas
					$scope.statusLogado = false;
					$scope.adquirentes = [];
					$scope.bandeiras = [];
					$scope.sacado = null;
					$scope.bandeiraSacado = [];
					$scope.filtro.adquirente = '';
					$scope.filtro.bandeira = '';
					$scope.filtro.sacado = '';
					$scope.filtro.faixa_registros = '0-0';
					$scope.filtro.pagina = 1;
					$scope.filtro.total_paginas = 0;
					$scope.filtro.total_registros = 0;
				}
			});
			// Obtém as permissões
			if($scope.methodsDoControllerCorrente){
				permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
				permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            //permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
			}
			// Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
			$scope.$on('acessoDeTelaNotificado', function(event){
				$scope.exibeTela = true;
				// Carrega filiais
				if($scope.usuariologado.grupoempresa) buscaAdquirentes();
			});
			// Acessou a tela
			$scope.$emit("acessouTela");
		};
		
		// PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar dados de acesso
      */
    $scope.usuarioPodeCadastrarBandeiraSacado = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.filial !== null && permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar info de dados de acesso
      */
    $scope.usuarioPodeAlterarBandeiraSacado = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.filial !== null && permissaoAlteracao;
    }
		
		// PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
			if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
				$scope.filtro.pagina = pagina;
				buscaBandeiraSacado(); 
			}
			$scope.atualizaPaginaDigitada();    
		};
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
			setPagina($scope.filtro.pagina - 1); 
		};
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function () {
			setPagina($scope.filtro.pagina + 1);
		};
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
			if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
			else $scope.atualizaPaginaDigitada();  
		};
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
			$scope.paginaInformada = $scope.filtro.pagina; 
		};                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
			if($scope.bandeiraSacado.length > 0) buscaBandeiraSacado();
		};
																							 
		$scope.cancelar = function(){
			$scope.exibePrimeiraLinha = false;    
		};
		
		var buscaAdquirentes = function(showMessage){
			
			if($scope.usuariologado.grupoempresa){
				
				$scope.showProgress(divPortletFiltroPos); 
				var filtros = [{id : /*$campos.card.tbadquirente.stAdquirente*/ 103, valor : 1}];
					
				$webapi.get($apis.getUrl($apis.card.tbadquirente, [$scope.token, 1, /*$campos.cliente.empresa.ds_fantasia*/ 101], filtros)) 
					.then(function(dados){
					//console.log(dados.Registros);
					$scope.adquirentes = dados.Registros;
					$scope.hideProgress(divPortletFiltroPos);
				},
				function(failData){
					if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
					$scope.hideProgress(divPortletBodyFiltrosPos);
				});
			}
		};
		
		var buscaBandeira = function(showMessage){
			
			if($scope.usuariologado.grupoempresa){
				
				$scope.showProgress(divPortletFiltroPos); 
				var filtros = [];
				if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
					filtros.push({id:/*$campos.card.tbbandeira.cdAdquirente*/ 102,
					valor: $scope.filtro.adquirente.cdAdquirente});
				}
					
				$webapi.get($apis.getUrl($apis.card.tbbandeira, [$scope.token, 1, /*$campos.card.tbbandeira.dsBandeira*/ 101], filtros)) 
					.then(function(dados){
					//console.log(dados.Registros);
					$scope.bandeiras = dados.Registros;
					$scope.hideProgress(divPortletFiltroPos);
				},
				function(failData){
					if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					else $scope.showAlert('Houve uma falha ao obter bandeiras (' + failData.status + ')', true, 'danger', true);
					$scope.hideProgress(divPortletBodyFiltrosPos);
				});
			}
		};
		
		var buscaBandeiraFixo = function(showMessage){
			
			if($scope.usuariologado.grupoempresa){
				
				var filtros = [];					
				$webapi.get($apis.getUrl($apis.card.tbbandeira, [$scope.token, 1, /*$campos.card.tbbandeira.dsBandeira*/ 101], filtros)) 
					.then(function(dados){
					//console.log(dados.Registros);
					$scope.bandeirasFixo = dados.Registros;
				},
				function(failData){
					if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					else $scope.showAlert('Houve uma falha ao obter bandeiras (' + failData.status + ')', true, 'danger', true);
				});
			}
		};
		
		$scope.alterouAdquirenteAlteracao = function(){
			if($scope.alteracao.adquirente != null) buscaBandeiraAlteracao();
		}
		
		var buscaBandeiraAlteracao = function(showMessage){
			
			if($scope.usuariologado.grupoempresa){
				
				//$scope.showProgress(divPortletFiltroPos); 
				var filtros = [];
				if($scope.alteracao.adquirente && $scope.alteracao.adquirente !== null){
					filtros.push({id:/*$campos.card.tbbandeira.cdAdquirente*/ 102,
					valor: $scope.alteracao.adquirente.cdAdquirente});
				}
					
				$webapi.get($apis.getUrl($apis.card.tbbandeira, [$scope.token, 1, /*$campos.card.tbbandeira.dsBandeira*/ 101], filtros)) 
					.then(function(dados){
					//console.log(dados.Registros);
					$scope.bandeirasAlteracao = dados.Registros;
					//$scope.hideProgress(divPortletFiltroPos);
				},
				function(failData){
					if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					else $scope.showAlert('Houve uma falha ao obter bandeiras (' + failData.status + ')', true, 'danger', true);
					//$scope.hideProgress(divPortletBodyFiltrosPos);
				});
			}
		};
		
		$scope.alterouAdquirenteCadastro = function(){
			if($scope.cadastro.adquirente != null) buscaBandeiraCadastro();
		}
		
		var buscaBandeiraCadastro = function(showMessage){
			
			if($scope.usuariologado.grupoempresa){
				
				//$scope.showProgress(divPortletFiltroPos); 
				var filtros = [];
				if($scope.cadastro.adquirente && $scope.cadastro.adquirente !== null){
					filtros.push({id:/*$campos.card.tbbandeira.cdAdquirente*/ 102,
					valor: $scope.cadastro.adquirente.cdAdquirente});
				}
					
				$webapi.get($apis.getUrl($apis.card.tbbandeira, [$scope.token, 1, /*$campos.card.tbbandeira.dsBandeira*/ 101], filtros)) 
					.then(function(dados){
					//console.log(dados.Registros);
					$scope.bandeirasCadastro = dados.Registros;
					//$scope.hideProgress(divPortletFiltroPos);
				},
				function(failData){
					if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					else $scope.showAlert('Houve uma falha ao obter bandeiras (' + failData.status + ')', true, 'danger', true);
					//$scope.hideProgress(divPortletBodyFiltrosPos);
				});
			}
		};
		
		$scope.alterouAdquirente = function(){
			$scope.filtro.bandeira = null;
			buscaBandeira();
		};
		
		$scope.limpaFiltros = function(){
			$scope.filtro.adquirente = null;
			$scope.filtro.bandeira = null;
			$scope.filtro.sacado = null;
			buscaAdquirentes();
			buscaBandeira();
			buscaBandeiraSacado();
		};
		
		$scope.buscaDados = function(){
			if($scope.filtro.sacado != null){
				if($scope.filtro.sacado.trim().length == 0){
					$scope.filtro.sacado = null;
				}
			}
			buscaBandeiraSacado();
		}
		
		var buscaBandeiraSacado = function(showMessage){
			if($scope.usuariologado.grupoempresa){
				
				$scope.showProgress(divPortletBodyPos); 
				var filtros = [];
				
				if($scope.filtro.bandeira && $scope.filtro.bandeira !== null){
					filtros.push({id:/*$campos.card.tbbandeirasacado.cdBandeira*/ 101,
								  valor: $scope.filtro.bandeira.cdBandeira});
				}
				if($scope.filtro.sacado && $scope.filtro.sacado !== null){
					filtros.push({id:/*$campos.card.tbbandeirasacado.cdSacado*/ 103,
								  valor: $scope.filtro.sacado});
				}
				
					
				$webapi.get($apis.getUrl($apis.card.tbbandeirasacado,
				[$scope.token, 1, /*$campos.card.tbbandeirasacado.cdBandeira*/ 101, 0,
				$scope.filtro.itens_pagina, $scope.filtro.pagina],
				filtros))
					.then(function(dados){
					$scope.bandeiraSacado = dados.Registros;
					$scope.filtro.total_registros = dados.TotalDeRegistros;
					$scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
					if($scope.bandeiraSacado.length === 0) $scope.filtro.faixa_registros = '0-0';
					else{
						var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
						var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
						if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
						$scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
					}
					// Verifica se a página atual é maior que o total de páginas
					if($scope.filtro.pagina > $scope.filtro.total_paginas)
						setPagina(1); // volta para a primeira página e refaz a busca
					$scope.alteracao.id = $scope.filtro.total_registros;
					// Esconde o progress
					$scope.hideProgress(divPortletBodyPos);
				},
				function(failData){
					if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					else $scope.showAlert('Houve uma falha ao obter dados Bandeira Sacado (' + failData.status + ')', true, 'danger', true);
					$scope.hideProgress(divPortletBodyFiltrosPos);
				});
			}
		};
		
		$scope.formataNomeBandeira = function(bandeira){
			if(bandeira != null)
				return bandeira.substring(0, bandeira.indexOf("-")).trim();
			else return null; 
		};
		
		$scope.formataBandeira = function(codigo){
			var nmBandeira = '';
			if(codigo != null){
				angular.forEach($scope.bandeirasFixo, function(bandeira){
					if(bandeira.cdBandeira == codigo)
						nmBandeira = bandeira.dsBandeira;
				});
				return nmBandeira;
			}
			else return null;
		};
		
		//EDITA DADOS BANDEIRA SACADO
		$scope.editarBandeiraSacado = function(item, index){
			// Reseta os valores
			$scope.alteracao.id = index;
			$scope.alteracao.grupo = item.cdGrupo;
			$scope.alteracao.sacado = item.cdSacado; 
			$scope.alteracao.parcelas = item.qtParcelas;
			$scope.alteracao.bandeira.cdBandeira = item.cdBandeira;
			//$scope.alteracao.bandeira.cdBandeira = item.tbBandeira.cdBandeira;
			//$scope.alteracao.bandeira.nmBandeira = item.tbBandeira.dsBandeira;
			// Exibe na linha
			$scope.alterando = true;
		};
		
		//CANCELA ALTERAÇÃO
		$scope.cancelaAlteracao = function(){
			$scope.alteracao.id = $scope.filtro.total_registros;
			$scope.alterando = false; 
			$scope.alteracao.adquirente = null;
			buscaBandeiraAlteracao();
			//$scope.alteracao.bandeira = null;
		};
		
		//ALTERA DADOS BANDEIRA SACADO
		$scope.alteraBandeiraSacado = function(item){
			if(typeof item === 'undefined') return;
			
			if($scope.alteracao.adquirente === null){
			   $scope.showModalAlerta('Selecione uma adquirente!');
			   return false;
			}
		   
		   if($scope.alteracao.bandeira === null){
			   $scope.showModalAlerta('Selecione uma adquirente!');
			   return false;
			}
			
			if($scope.alteracao.sacado.trim().length == 0){
			   $scope.showModalAlerta('É necessário digitar o sacado!');
			   return false;
			}
			   
		   if($scope.alteracao.parcelas == null){
				$scope.showModalAlerta('É necessário digitar a quantidade de parcelas!');
			   return false;   
			}
		   
			// Altera
			$scope.showProgress(divPortletFiltroPos); // z-index < z-index do fullscreen    
			$scope.showProgress(divPortletBodyPos);
			var jsonBandeiraSacado = { 
				cdGrupo :  $scope.usuariologado.grupoempresa &&  $scope.usuariologado.grupoempresa !== null ? $scope.usuariologado.grupoempresa.id_grupo : 0,// grupo associado
				oldCdSacado : item.cdSacado, // cdSacado que está armazenado na base
				//oldCdBandeira : item.tbBandeira.cdBandeira, // bandeira que está armazenada na base
				oldCdBandeira : item.cdBandeira, // bandeira que está armazenada na base
				oldQtParcelas : item.qtParcelas, // parcelas que  está armazenado na base
				newCdSacado : $scope.alteracao.sacado, // sacado informado na alteração
				newCdBandeira : $scope.alteracao.bandeira.cdBandeira, // bandeira informada na alteração
				newQtParcelas : $scope.alteracao.parcelas // parcelas informada na alteração
			};
        
			$webapi.update($apis.getUrl($apis.card.tbbandeirasacado, undefined,
                                   {id : 'token', valor : $scope.token}), jsonBandeiraSacado) 
            .then(function(dados){           
                $scope.showAlert('Alterado com sucesso!', true, 'success', true);
                // Esconde a linha
                $scope.cancelaAlteracao();
                // Relista
                buscaBandeiraSacado();
				$scope.hideProgress(divPortletFiltroPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao atualizar os dados (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress(divPortletFiltroPos);
                 $scope.hideProgress(divPortletBodyPos);
              });  
		};
		
		//CADASTRO
		$scope.novoBandeiraSacado = function(){
			// Reseta os valores
			$scope.cadastro.adquirente = null;
			$scope.cadastro.bandeira = null;
			$scope.cadastro.sacado = '';
			$scope.cadastro.parcelas = 0;
			// Exibe a linha
			$scope.exibePrimeiraLinha = true;        
		};
		
		$scope.cancelarNovo = function(){
			$scope.exibePrimeiraLinha = false;    
		};
		
		 var validaBandeiraSacado = function(){
		   if($scope.cadastro.adquirente === null){
			   $scope.showModalAlerta('Selecione uma adquirente!');
			   return false;
		   }
		   
		   if($scope.cadastro.bandeira === null){
			   $scope.showModalAlerta('Selecione uma adquirente!');
			   return false;
		   }
		   
		   if($scope.cadastro.sacado.trim().length == 0){
			   $scope.showModalAlerta('É necessário digitar o sacado!');
			   return false;
		   }
			   
		   if($scope.cadastro.parcelas == null){
				$scope.showModalAlerta('É necessário digitar a quantidade de parcelas!');
			   return false;   
		   }
		   
		   return true;
		};
		
		$scope.salvarBandeiraSacado = function(){
		   if(!validaBandeiraSacado()) return;    
		   // Cadastra
		   $scope.showProgress(divPortletFiltroPos, 10000); // z-index < z-index do fullscreen    
		   $scope.showProgress(divPortletBodyPos);
		   var jsonBandeiraSacadoSalvar = {
				cdGrupo : $scope.usuariologado.grupoempresa &&  $scope.usuariologado.grupoempresa !== null ? $scope.usuariologado.grupoempresa.id_grupo : 0,// grupo associado
				cdSacado : $scope.cadastro.sacado,//novo sacado
				qtParcelas : $scope.cadastro.parcelas,//nova parcela
				cdBandeira : $scope.cadastro.bandeira.cdBandeira//nova bandeira
			}; 
			
		   $webapi.post($apis.getUrl($apis.card.tbbandeirasacado, undefined,
									 {id : 'token', valor : $scope.token}), jsonBandeiraSacadoSalvar) 
				.then(function(dados){           
					$scope.showAlert('Cadastrado com sucesso!', true, 'success', true);
					// Esconde a linha
					$scope.exibePrimeiraLinha = false;
					// Relista
					buscaBandeiraSacado();
					$scope.hideProgress(divPortletFiltroPos);
				  },
				  function(failData){
					 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					 else $scope.showAlert('Houve uma falha ao realizar o cadastro (' + failData.status + ')', true, 'danger', true);
					 // Fecha os progress
					 $scope.hideProgress(divPortletFiltroPos);
					 $scope.hideProgress(divPortletBodyPos);
				  }); 
			};		
	}]);
	